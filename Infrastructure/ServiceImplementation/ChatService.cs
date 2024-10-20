using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Hubs;
using ChatApp.Models.Chat;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace ChatApp.Infrastructure.ServiceImplementation
{
    public class ChatService : IChatService
    {
        #region Private Fields
        private readonly ChatAppContext _context;
        private readonly IUserService _userService;
        private readonly IHubContext<MessageHub> _hubContext;
        private readonly IWebHostEnvironment _hostEnvironment;
        #endregion

        #region Constructor
        public ChatService(ChatAppContext context, IUserService userService, IWebHostEnvironment hostEnvironment, IHubContext<MessageHub> hubContext)
        {
            _context = context;
            _userService = userService;
            _hubContext = hubContext;
            _hostEnvironment = hostEnvironment;
        }
        #endregion

        #region Methods

        //get chatList
        public IEnumerable<ChatModel> GetChatList(int userFrom, int userTo, string fromUserName, string toUserName)
        {
            try
            {
                var chats = _context.Chats.Where(u => (u.MessageFrom == userFrom && u.MessageTo == userTo) || (u.MessageFrom == userTo && u.MessageTo == userFrom)).OrderBy(e => e.CreatedAt).ToList();

                var returnChat = chats;

                IEnumerable<ChatModel> list = ConvertChatToChatModel(returnChat, fromUserName, toUserName, userFrom, userTo);

                return list;
            }
            catch (Exception)
            {
                throw;
            }
        }

        //recent chat
        public IEnumerable<RecentChatModel> GetRecentList(int userID)
        {
            try
            {
                //get all chats that belongs to current user then take other person's id from it. and at last take distinct
                var chats = _context.Chats.Where(e => (e.MessageFrom == userID || e.MessageTo == userID)).Select(e => e.MessageFrom == userID ? e.MessageTo : e.MessageFrom).Distinct();


                //convert chats to RecentChatModel..
                var returnObj = new List<RecentChatModel>();

                foreach (var chat in chats)
                {
                    Profile profile = _userService.GetUser(e => e.Id == chat);

                    var allMsgs = _context.Chats.OrderBy(o => o.CreatedAt).Where(
                        e => (e.MessageFrom == userID && e.MessageTo == profile.Id) || (e.MessageFrom == profile.Id && e.MessageTo == userID)
                        );

                    //count where receiver is current user and is not seen by user
                    var unseenCnt = allMsgs.Count(e => e.MessageTo == userID && e.SeenByReceiver == 0);

                    //sort chats by created date then select last chat from table
                    var lastMsgObj = allMsgs.LastOrDefault();

                    string lastMsg = "";
                    DateTime? lastMsgTime = null;

                    if (lastMsgObj != null)
                    {
                        lastMsg = lastMsgObj.Content;
                        lastMsgTime = lastMsgObj.CreatedAt;
                    }

                    var userObj = new RecentChatModel();
                    //userObj.User = ModelMapper.ConvertProfileToDTO(profile);
                    userObj.LastMessage = lastMsg;
                    userObj.LastMsgTime = lastMsgTime;
                    userObj.UnseenCount = unseenCnt;
                    userObj.FirstName = profile.FirstName;
                    userObj.LastName = profile.LastName;
                    userObj.UserName = profile.UserName;
                    userObj.ImageUrl = profile.ImageUrl;

                    returnObj.Add(userObj);
                }

                //order list by last msg time :)
                returnObj = returnObj.OrderByDescending(e => e.LastMsgTime).ToList(); ;

                return returnObj;
            }
            catch (Exception)
            {
                throw;
            }  
        }

        //send message
        public async Task<ChatModel> SendTextMessage(string fromUser, string toUser, string content, int? RepliedTo)
        {
            try
            {
                int fromId = _userService.GetIdFromUsername(fromUser);
                int toId = _userService.GetIdFromUsername(toUser);

                Chat chat = new Chat();

                chat.MessageFrom = fromId;
                chat.MessageTo = toId;
                chat.Content = content;
                chat.CreatedAt = DateTime.Now;
                chat.UpdatedAt = DateTime.Now;
                chat.Type = "text";
                chat.SeenByReceiver = 0;

                if (RepliedTo != null)
                {
                    chat.RepliedTo = RepliedTo;
                }
                else
                {
                    chat.RepliedTo = -1;
                }

                //save chat
                _context.Chats.Add(chat);
                _context.SaveChanges();

                string ReplyMsg = "";
                if (RepliedTo != null)
                {
                    ReplyMsg = _context.Chats.FirstOrDefault(e => e.Id == RepliedTo).Content;
                }

                //return chatModel
                var returnObj = new ChatModel()
                {
                    Id = chat.Id,
                    MessageFrom = fromUser,
                    MessageTo = toUser,
                    Content = content,
                    Type = "text",
                    CreatedAt = chat.CreatedAt,
                    RepliedTo = ReplyMsg
                };

                await SendChatNotification(returnObj, toId, fromId);

                return returnObj;
            }
            catch (Exception)
            {
                throw;
            }
        }

        //send files
        public async Task<ChatModel> SendFileMessage(string fromUser, string toUser, ChatSendModel SendChat)
        {
            try
            {
                //var tmp = SendChat.File.ContentType;
                //save file
                var file = SendChat.File;

                string wwwRootPath = _hostEnvironment.WebRootPath;

                string fileName = Guid.NewGuid().ToString(); //new generated name of the file
                var extension = Path.GetExtension(file.FileName); // extension of the file

                var pathToSave = Path.Combine(wwwRootPath, @"chat");

                var dbPath = Path.Combine(pathToSave, fileName + extension);
                using (var fileStreams = new FileStream(dbPath, FileMode.Create))
                {
                    file.CopyTo(fileStreams);
                }

                //save chat in Database
                int fromId = _userService.GetIdFromUsername(fromUser);
                int toId = _userService.GetIdFromUsername(toUser);

                Chat chat = new Chat();

                chat.MessageFrom = fromId;
                chat.MessageTo = toId;
                chat.Content = SendChat.Content;
                chat.CreatedAt = DateTime.Now;
                chat.UpdatedAt = DateTime.Now;
                chat.Type = file.ContentType.Split('/')[0];
                chat.SeenByReceiver = 0;
                chat.FilePath = fileName + extension;

                if (SendChat.RepliedTo != null)
                {
                    chat.RepliedTo = SendChat.RepliedTo;
                }
                else
                {
                    chat.RepliedTo = -1;
                }

                //save chat
                _context.Chats.Add(chat);
                _context.SaveChanges();


                //convert to chatModel
                string ReplyMsg = "";
                if (SendChat.RepliedTo != null)
                {
                    ReplyMsg = _context.Chats.FirstOrDefault(e => e.Id == SendChat.RepliedTo).Content;
                }

                var returnObj = new ChatModel()
                {
                    Id = chat.Id,
                    MessageFrom = fromUser,
                    MessageTo = toUser,
                    Content = chat.Content,
                    Type = file.ContentType.Split('/')[0],
                    CreatedAt = chat.CreatedAt,
                    RepliedTo = ReplyMsg,
                    FilePath = fileName + extension,
                };

                await SendChatNotification(returnObj, toId, fromId);

                //return chatModel
                return returnObj;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public IEnumerable<ChatDataModel> GetChatData(int UserId)
        {
            try
            {
                //group by and then coubt
                var ChatList = _context.Chats.Where(e => e.MessageFrom == UserId || e.MessageTo == UserId).GroupBy(e => e.CreatedAt.Date).Select(
                    e => new ChatDataModel() { Date = e.Key.ToString("yyyy-MM-dd"), Value = e.Count() });

                return ChatList;
            }
            catch (Exception) {
                throw;
            }
        }
        #endregion

        #region Private Methods
        private IEnumerable<ChatModel> ConvertChatToChatModel(IEnumerable<Chat> curList, string from, string to, int fromId, int toId)
        {
            IList<ChatModel> returnObj = new List<ChatModel>();

            foreach (var chat in curList)
            {
                var newObj = new ChatModel()
                {
                    Id = chat.Id,
                    MessageFrom = (chat.MessageFrom == fromId) ? from : to,
                    MessageTo = (chat.MessageTo == fromId) ? from : to,
                    Type = chat.Type,
                    Content = chat.Content,
                    CreatedAt = chat.CreatedAt,
                    SeenByReceiver = chat.SeenByReceiver,
                    FilePath = chat.FilePath,
                };

                //if msg is replied then get content
                if(chat.RepliedTo != -1)
                {
                    newObj.RepliedTo = _context.Chats.FirstOrDefault(e => e.Id == chat.RepliedTo).Content;
                }

                returnObj.Add(newObj);
            }

            return returnObj;
        }

        private string GetConnectionId(int UserId)
        {
            var conn = _context.Connections.FirstOrDefault(e => e.ProfileId == UserId);
            if (conn == null) return "";
            return conn.SignalId;
        }

        private async Task SendChatNotification(ChatModel returnObj, int toId, int fromId)
        {
            //add notifications
            var notification = new Notification()
            {
                Content = returnObj.MessageFrom,
                Type = "Message",
                CreatedAt = DateTime.Now,
                IsSeen = 0,
                UserId = toId
            };

            _context.Notifications.Add(notification);
            _context.SaveChanges();


            //send chat & notification to receiver
            var rConnection = await _context.Connections.FirstOrDefaultAsync(e => e.ProfileId == toId);
            var sConnection = await _context.Connections.FirstOrDefaultAsync(e => e.ProfileId == fromId);

            if (rConnection != null)
            {
                await _hubContext.Clients.Clients(rConnection.SignalId, sConnection?.SignalId).SendAsync("receiveMessage", returnObj);

                var notificationDto = ModelMapper.NotificationToDTO(notification);
                await _hubContext.Clients.Client(rConnection.SignalId).SendAsync("addNotification", notificationDto);
            }
            else
            {
                await _hubContext.Clients.Clients(sConnection?.SignalId).SendAsync("receiveMessage", returnObj);
            }
        }

        #endregion
    }
}

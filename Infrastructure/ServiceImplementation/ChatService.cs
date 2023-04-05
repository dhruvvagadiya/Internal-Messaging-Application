using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Models.Chat;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ChatApp.Infrastructure.ServiceImplementation
{
    public class ChatService : IChatService
    {
        private readonly ChatAppContext _context;
        private readonly IUserService _userService;
        public ChatService(ChatAppContext context, IUserService userService)
        {
            _context = context;
            _userService = userService;
        }

        //get chatList
        public IEnumerable<ChatModel> GetChatList(int userFrom, int userTo, string fromUserName, string toUserName)
        {

            var chats = _context.Chats.Where(u => (u.MessageFrom == userFrom && u.MessageTo == userTo) || (u.MessageFrom == userTo && u.MessageTo == userFrom)).ToList();

            var returnChat = chats;

            IEnumerable<ChatModel> list = ConvertChatToChatModel(returnChat, fromUserName, toUserName, userFrom, userTo);

            return list;
        }

        //recent chat
        public IEnumerable<RecentChatModel> GetRecentList(int userID)
        {
            //get all chats that belongs to current user then take other person's id from it. and at last take distinct
            var chats = _context.Chats.Where(e => (e.MessageFrom == userID || e.MessageTo == userID)).Select(e => e.MessageFrom == userID ? e.MessageTo : e.MessageFrom).Distinct();


            //convert chats to chatModel..
            var returnObj = new List<RecentChatModel>();

            foreach (var chat in chats)
            {
                Profile profile = _userService.GetUser(e => e.Id == chat);

                //sort chats by created date then select last chat from table
                var lastMsgObj = _context.Chats.OrderBy(o => o.CreatedAt).LastOrDefault(
                    e => (e.MessageFrom == userID && e.MessageTo == profile.Id) || (e.MessageFrom == profile.Id && e.MessageTo == userID)
                    );

                string lastMsg = "";
                DateTime? lastMsgTime = null;

                if(lastMsgObj != null)
                {
                    lastMsg = lastMsgObj.Content;
                    lastMsgTime = lastMsgObj.CreatedAt;
                }

                var userObj = new RecentChatModel();
                userObj.User = ModelMapper.ConvertProfileToDTO(profile);
                userObj.LastMessage = lastMsg;
                userObj.LastMsgTime = lastMsgTime;

                returnObj.Add(userObj);
            }

            //order list by last msg time :)
            returnObj = returnObj.OrderByDescending(e => e.LastMsgTime).ToList();;

            return returnObj;
        }

        //send message
        public ChatModel SendTextMessage(string fromUser, string toUser, string content, int? RepliedTo)
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

            if(RepliedTo != null)
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
            if(RepliedTo != null)
            {
                ReplyMsg = _context.Chats.FirstOrDefault(e => e.Id == RepliedTo).Content;
            }

            //return chatModel
            var returnObj = new ChatModel()
            {
                MessageFrom = fromUser,
                MessageTo = toUser,
                Content = content,
                Type = "text",
                CreatedAt = chat.CreatedAt,
                UpdatedAt = chat.UpdatedAt,
                RepliedTo = ReplyMsg
            };

            return returnObj;
        }


        private IEnumerable<ChatModel> ConvertChatToChatModel(IEnumerable<Chat> curList, string from, string to, int fromId, int toId)
        {
            var returnObj = new List<ChatModel>();

            foreach (var chat in curList)
            {
                var newObj = new ChatModel()
                {
                    Id = chat.Id,
                    MessageFrom = (chat.MessageFrom == fromId) ? from : to,
                    MessageTo = (chat.MessageTo == fromId) ? from : to,
                    Type = "Text",
                    Content = chat.Content,
                    CreatedAt = chat.CreatedAt,
                    UpdatedAt = chat.UpdatedAt
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
    }
}

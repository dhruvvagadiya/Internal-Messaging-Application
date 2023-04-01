using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Models.Chat;
using ChatApp.Models.Users;
using System;
using System.Collections.Generic;
using System.Globalization;
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

            IEnumerable<ChatModel> list = ModelMapper.ConvertChatToChatModel(returnChat, fromUserName, toUserName, userFrom, userTo);

            return list;
        }

        //recent chat
        public IEnumerable<RecentChatModel> GetRecentList(int userID)
        {
            //get all chats that belongs to current user then take other person's id from it. and at last take distinct
            var chats = _context.Chats.Where(e => (e.MessageFrom == userID || e.MessageTo == userID)).Select(e => e.MessageFrom == userID ? e.MessageTo : e.MessageFrom).Distinct();


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

            return returnObj;
        }

        //send message
        public ChatModel SendTextMessage(string fromUser, string toUser, string content)
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

            //save chat
            _context.Chats.Add(chat);
            _context.SaveChanges();

            //return chatModel
            var returnObj = new ChatModel()
            {
                MessageFrom = fromUser,
                MessageTo = toUser,
                Content = content,
                Type = "text",
                CreatedAt = chat.CreatedAt,
                UpdatedAt = chat.UpdatedAt
            };

            return returnObj;
        }

    }
}

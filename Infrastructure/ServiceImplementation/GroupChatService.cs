using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Models.Chat;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System.Linq;
using System;
using ChatApp.Models.GroupChat;
using ChatApp.Context.EntityClasses.Group;
using System.Reflection;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using ChatApp.Models.Group;

namespace ChatApp.Infrastructure.ServiceImplementation
{
    public class GroupChatService : IGroupChatService
    {
        #region Private Fields
        private readonly ChatAppContext _context;
        private readonly IUserService _userService;
        private readonly IWebHostEnvironment _hostEnvironment;
        #endregion

        #region Constructor
        public GroupChatService(ChatAppContext context, IUserService userService, IWebHostEnvironment hostEnvironment)
        {
            _context = context;
            _userService = userService;
            _hostEnvironment = hostEnvironment;
        }
        #endregion

        #region Methods

        public IEnumerable<GroupRecentModel> GetRecentList (int UserId)
        {
            //1. get all group Ids in which user is
            var GroupList = _context.GroupMembers.Where(e => e.UserId == UserId).Include("Group").Select(e => e.Group);

            IList<GroupRecentModel> returnObj = new List<GroupRecentModel>();

            //2. GetLast msg for each group
            foreach (var Group in GroupList)
            {
                var newObj = new GroupRecentModel();

                newObj.Group = new GroupDTO()
                {
                    Id = Group.Id,
                    Name = Group.Name,
                    CreatedAt = Group.CreatedAt,
                    UpdatedAt = Group.UpdatedAt,
                    ImageUrl = Group.ImageUrl,
                    Description = Group.Description,
                    CreatedBy = _userService.GetUser(e => e.Id == Group.CreatedBy).UserName
                };

                var LastChat = _context.GroupChats.Where(e => e.GroupId == Group.Id).OrderBy(e => e.CreatedAt).LastOrDefault();

                if (LastChat != null)
                {
                    newObj.LastMsgTime = LastChat.CreatedAt;

                    if (LastChat.FilePath != null) newObj.LastMessage = "file";
                    else newObj.LastMessage = LastChat.Content;

                    var Sender = _context.Profiles.FirstOrDefault(e => e.Id == LastChat.MessageFrom);

                    newObj.FirstName = Sender.FirstName;
                    newObj.LastName = Sender.LastName;
                    newObj.ImageUrl = Sender.ImageUrl;
                }

                returnObj.Add(newObj);
            }

            //sort by time
            returnObj = returnObj.OrderByDescending(e => e.LastMsgTime).ToList();

            return returnObj;
        }

        //send message
        public GroupChatModel SendTextMessage(Profile Sender, int groupId, string content, int? RepliedTo)
        {

            GroupChat chat = new GroupChat();

            chat.GroupId = groupId;
            chat.MessageFrom = Sender.Id;
            chat.Content = content;
            chat.CreatedAt = DateTime.Now;
            chat.UpdatedAt = DateTime.Now;
            chat.Type = "text";

            if (RepliedTo != null)
            {
                chat.RepliedTo = RepliedTo;
            }
            else
            {
                chat.RepliedTo = -1;
            }

            //save chat
            _context.GroupChats.Add(chat);
            _context.SaveChanges();

            string ReplyMsg = "";
            if (RepliedTo != null)
            {
                ReplyMsg = _context.GroupChats.FirstOrDefault(e => e.Id == RepliedTo).Content;
            }

            //return chatModel
            var returnObj = new GroupChatModel()
            {
                Id = chat.Id,
                GroupId = chat.GroupId,
                MessageFrom = Sender.UserName,
                Content = content,
                Type = "text",
                CreatedAt = chat.CreatedAt,
                UpdatedAt = chat.UpdatedAt,
                RepliedTo = ReplyMsg,
                FirstName = Sender.FirstName,
                LastName = Sender.LastName,
                ImageUrl = Sender.ImageUrl
            };

            return returnObj;
        }

        //send files
        public GroupChatModel SendFileMessage(Profile Sender, GroupChatSendModel SendChat)
        {
            //var tmp = SendChat.File.ContentType;
            //save file
            var file = SendChat.File;

            string wwwRootPath = _hostEnvironment.WebRootPath;

            string fileName = Guid.NewGuid().ToString(); //new generated name of the file
            var extension = Path.GetExtension(file.FileName); // extension of the file

            var pathToSave = Path.Combine(wwwRootPath, @"GroupChat");

            var dbPath = Path.Combine(pathToSave, fileName + extension);
            using (var fileStreams = new FileStream(dbPath, FileMode.Create))
            {
                file.CopyTo(fileStreams);
            }

            //save chat in Database

            GroupChat chat = new GroupChat();

            chat.GroupId = SendChat.GroupId;
            chat.MessageFrom = Sender.Id;
            chat.Content = SendChat.Content;
            chat.CreatedAt = DateTime.Now;
            chat.UpdatedAt = DateTime.Now;
            chat.Type = file.ContentType.Split('/')[0];
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
            _context.GroupChats.Add(chat);
            _context.SaveChanges();


            //convert to chatModel
            string ReplyMsg = "";
            if (SendChat.RepliedTo != null)
            {
                ReplyMsg = _context.GroupChats.FirstOrDefault(e => e.Id == SendChat.RepliedTo).Content;
            }

            var returnObj = new GroupChatModel()
            {
                Id = chat.Id,
                GroupId = chat.GroupId,
                MessageFrom = Sender.UserName,
                Content = chat.Content,
                Type = file.ContentType.Split('/')[0],
                CreatedAt = chat.CreatedAt,
                UpdatedAt = chat.UpdatedAt,
                RepliedTo = ReplyMsg,
                FilePath = fileName + extension,
                FirstName = Sender.FirstName,
                LastName = Sender.LastName,
                ImageUrl = Sender.ImageUrl
            };

            //return chatModel
            return returnObj;
        }

        //chat list of group
        public IEnumerable<GroupChatModel> GetChatList(int GroupId)
        {
            var ChatList = _context.GroupChats.Where(e => e.GroupId == GroupId).OrderBy(e => e.CreatedAt).Include("MessageFromUser");

            IList<GroupChatModel> returnObj = new List<GroupChatModel>();
            foreach(var GroupChat in  ChatList)
            {
                var newObj = ConvertChatToChatModel(GroupChat);

                if(GroupChat.RepliedTo != -1)
                {
                    newObj.RepliedTo = _context.GroupChats.FirstOrDefault(e => e.Id == GroupChat.RepliedTo).Content;
                }

                returnObj.Add(newObj);
            }

            return returnObj;
        }


        //check whether user is part of the group
        public bool IsaMemberOf(int UserId, int GroupId)
        {
            var member = _context.GroupMembers.FirstOrDefault(e => e.GroupId == GroupId && e.UserId == UserId);
            return member != null;
        }

        //check if group exists or not
        public bool Exists(int GroupId)
        {
            return _context.Groups.FirstOrDefault(e => e.Id == GroupId) != null;
        }

        #endregion

        #region Private Methods

        private GroupChatModel ConvertChatToChatModel(GroupChat chat)
        {
            var returnObj = new GroupChatModel()
            {
                Id = chat.Id,
                GroupId = chat.GroupId,
                MessageFrom = chat.MessageFromUser.UserName,
                FirstName = chat.MessageFromUser.FirstName,
                LastName = chat.MessageFromUser.LastName,
                ImageUrl = chat.MessageFromUser.ImageUrl,
                Type = chat.Type,
                Content = chat.Content,
                FilePath = chat.FilePath,
                CreatedAt = chat.CreatedAt,
                UpdatedAt = chat.UpdatedAt
            };

            return returnObj;
        }

        #endregion
    }
}

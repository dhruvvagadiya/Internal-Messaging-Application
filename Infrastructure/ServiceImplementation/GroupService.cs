using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Context.EntityClasses.Group;
using ChatApp.Models.Group;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;

namespace ChatApp.Infrastructure.ServiceImplementation
{

    public class GroupService : IGroupService
    {
        #region Fields
        private readonly ChatAppContext _context;
        private readonly INotificationService _notificationService;
        private readonly IWebHostEnvironment _hostEnvironment;
        #endregion

        #region Constructor
        public GroupService(ChatAppContext context, IWebHostEnvironment webHost, INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
            _hostEnvironment = webHost;
        }
        #endregion

        #region Methods
        public GroupDTO CreateGroup(int UserId, CreateGroup Obj)
        {
            //1. create Group
            var Group = new Group();
            Group.Name = Obj.GroupName;
            Group.CreatedAt = DateTime.Now;
            Group.UpdatedAt = Group.CreatedAt;
            Group.CreatedBy = UserId;
            Group.Description = Obj.Description;

            //save profile if file provided
            if (Obj.ProfileImage != null)
            {
                var file = Obj.ProfileImage;

                string wwwRootPath = _hostEnvironment.WebRootPath;

                string fileName = Guid.NewGuid().ToString(); //new generated name of the file
                var extension = Path.GetExtension(file.FileName); // extension of the file

                var pathToSave = Path.Combine(wwwRootPath, @"GroupChat");

                var dbPath = Path.Combine(pathToSave, fileName + extension);
                using (var fileStreams = new FileStream(dbPath, FileMode.Create))
                {
                    file.CopyTo(fileStreams);
                }

                Group.ImageUrl = fileName + extension;
            }

            _context.Add(Group);
            _context.SaveChanges();

            //2. add creator in Group members
            AddUser(UserId, Group);

            //3. covert to DTO
            var returnObj = GroupToGroupDTO(Group, Obj.UserName);

            //return DTO
            return returnObj;
        }
        public bool DeleteGroup(Group CurGroup)
        {

            string wwwRootPath = _hostEnvironment.WebRootPath;
            var pathToSave = Path.Combine(wwwRootPath, @"GroupChat");

            //1. remove profile image if exists
            if (CurGroup.ImageUrl != null)
            {
                if (System.IO.File.Exists(Path.Combine(pathToSave, CurGroup.ImageUrl)))
                {
                    System.IO.File.Delete(Path.Combine(pathToSave, CurGroup.ImageUrl));
                }
            }

            //2. delete Group
            _context.Remove(CurGroup);

            //3. remove members
            var memberList = _context.GroupMembers.Where(e => e.GroupId == CurGroup.Id);
            _context.RemoveRange(memberList);

            //4. remove chats
            var ChatList = _context.GroupChats.Where(e => e.GroupId == CurGroup.Id);

            //5. delete all media from the chat
            foreach (var chat in ChatList)
            {
                if (chat.FilePath != null)
                {
                    if (System.IO.File.Exists(Path.Combine(pathToSave, chat.FilePath)))
                    {
                        System.IO.File.Delete(Path.Combine(pathToSave, chat.FilePath));
                    }
                }
            }

            _context.RemoveRange(ChatList);
            _context.SaveChanges();

            return true;
        }
        public GroupDTO UpdateGroup(CreateGroup Obj, Group CurGroup)
        {

            CurGroup.UpdatedAt = DateTime.Now;
            CurGroup.Name = Obj.GroupName;
            CurGroup.Description = Obj.Description;

            //save profile if file provided
            if (Obj.ProfileImage != null)
            {
                var file = Obj.ProfileImage;

                string wwwRootPath = _hostEnvironment.WebRootPath;

                string fileName = Guid.NewGuid().ToString(); //new generated name of the file
                var extension = Path.GetExtension(file.FileName); // extension of the file

                var pathToSave = Path.Combine(wwwRootPath, @"GroupChat");

                //delete original image
                if (CurGroup.ImageUrl != null)
                {
                    if (System.IO.File.Exists(Path.Combine(pathToSave, CurGroup.ImageUrl)))
                    {
                        System.IO.File.Delete(Path.Combine(pathToSave, CurGroup.ImageUrl));
                    }
                }

                var dbPath = Path.Combine(pathToSave, fileName + extension);
                using (var fileStreams = new FileStream(dbPath, FileMode.Create))
                {
                    file.CopyTo(fileStreams);
                }

                CurGroup.ImageUrl = fileName + extension;
            }

            _context.Update(CurGroup);
            _context.SaveChanges();

            var returnObj = GroupToGroupDTO(CurGroup, Obj.UserName);

            return returnObj;
        }
        public GroupMember AddUser(int UserId, Group CurGroup)
        {
            //1. Check if group exists
            // 2. Check whether user is already added in Group or not
            var GroupMember = _context.GroupMembers.FirstOrDefault(e => e.GroupId == CurGroup.Id && e.UserId == UserId);

            if (GroupMember != null)
            {
                return null;
            }

            // 3. Add user to Group
            var addObj = new GroupMember();
            addObj.GroupId = CurGroup.Id;
            addObj.UserId = UserId;
            addObj.AddedAt = DateTime.Now;

            _context.Add(addObj);
            _context.SaveChanges();

            return addObj;
        }
        public bool RemoveUser(int UserId, Group CurGroup)
        {
            //1. Check if Group exists
            // 2. Check whether user is added in Group or not
            var GroupMember = _context.GroupMembers.FirstOrDefault(e => e.GroupId == CurGroup.Id && e.UserId == UserId);

            if (GroupMember == null)
            {
                return false;
            }

            _context.Remove(GroupMember);
            _context.SaveChanges();

            //3. if Group is empty then delete Group
            var members = _context.GroupMembers.Where(e => e.GroupId == CurGroup.Id).OrderBy(e => e.AddedAt);
            if (members == null || members.Count() == 0)
            {
                DeleteGroup(CurGroup);
                return true;
            }

            //4. if cur user was the creator then make oldest user creator
            if (CurGroup.CreatedBy == UserId && members.Count() > 0)
            {
                CurGroup.CreatedBy = members.First().UserId;
                CurGroup.UpdatedAt = DateTime.Now;
            }

            _context.Update(CurGroup);
            _context.SaveChanges();

            return true;
        }
        public IEnumerable<GroupDTO> GetAllGroups(int UserId, string UserName)
        {
            //1. get ids of all Groups in which current user is
            var ids = _context.GroupMembers.Where(e => e.UserId == UserId).Select(e => e.GroupId).Distinct();

            IList<GroupDTO> returnObj = new List<GroupDTO>();

            //2. get all Groups and convert it to DTOs
            foreach (var GroupId in ids)
            {
                var Group = _context.Groups.FirstOrDefault(e => e.Id == GroupId);
                var GroupDto = GroupToGroupDTO(Group, UserName);

                returnObj.Add(GroupDto);
            }

            //3. TODO : sort this Groups in order of their last msg time

            return returnObj;
        }
        public IEnumerable<GroupMemberDTO> GetAllMembers(int GroupId)
        {
            var groupMembers = _context.GroupMembers.Where(e => e.GroupId == GroupId).Include("User").Select(e =>

                new GroupMemberDTO()
                {
                    UserName = e.User.UserName,
                    FirstName = e.User.FirstName,
                    LastName = e.User.LastName,
                    ImageUrl = e.User.ImageUrl,
                    Status = e.User.Status,
                    AddedAt = e.AddedAt
                }
            ).ToList();

            return groupMembers;
        }

        public Group GetGroup(Expression<Func<Group, bool>> filter)
        {
            return _context.Groups.FirstOrDefault(filter);
        }

        #endregion

        #region P Methods
        public GroupDTO GroupToGroupDTO(Group Group, string UserName)
        {
            var Obj = new GroupDTO();
            Obj.Id = Group.Id;
            Obj.Name = Group.Name;
            Obj.CreatedAt = Group.CreatedAt;
            Obj.UpdatedAt = Group.UpdatedAt;
            Obj.CreatedBy = UserName;
            Obj.ImageUrl = Group.ImageUrl;
            Obj.Description = Group.Description;
            return Obj;
        }

        #endregion
    }
}

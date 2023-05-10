using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Models.Users;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;

namespace ChatApp.Infrastructure.ServiceImplementation
{
    public class UserService : IUserService
    {
        #region Private fields
        private readonly IWebHostEnvironment _hostEnvironment;
        private readonly ChatAppContext context;
        #endregion

        #region Constructor
        public UserService(ChatAppContext context, IWebHostEnvironment hostEnvironment)
        {
            this.context = context;
            _hostEnvironment = hostEnvironment;
        }
        #endregion

        #region Methods
        public Profile UpdateUser(UpdateModel updateModel, string username)
        {
            try
            {
                //check if username is valid or not
                var user = GetUser(e => e.UserName == username);

                if (user == null)
                {
                    return null;
                }

                //check if other user with this mail already exists
                var user2 = GetUser(e => e.Email == updateModel.Email, tracked: false);

                if (user2 != null && user2.UserName != user.UserName)
                {
                    return new Profile();
                }


                if (updateModel.File != null)
                {
                    var file = updateModel.File;

                    string wwwRootPath = _hostEnvironment.WebRootPath;

                    string fileName = Guid.NewGuid().ToString(); //new generated name of the file
                    var extension = Path.GetExtension(file.FileName); // extension of the file

                    var pathToSave = Path.Combine(wwwRootPath, @"images");

                    //delete old image to update with new one
                    if (user.ImageUrl != null)
                    {
                        if (System.IO.File.Exists(Path.Combine(pathToSave, user.ImageUrl)))
                        {
                            System.IO.File.Delete(Path.Combine(pathToSave, user.ImageUrl));
                        }
                    }

                    var dbPath = Path.Combine(pathToSave, fileName + extension);
                    using (var fileStreams = new FileStream(dbPath, FileMode.Create))
                    {
                        file.CopyTo(fileStreams);
                    }

                    //update image url
                    user.ImageUrl = fileName + extension;

                }

                user.Email = updateModel.Email;
                user.FirstName = updateModel.FirstName;
                user.LastName = updateModel.LastName;
                user.LastUpdatedAt = DateTime.Now;
                user.LastUpdatedBy = (int)ProfileType.User;

                context.Profiles.Update(user);
                context.SaveChanges();

                return user;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public IEnumerable<ProfileDTO> GetAll(string name, string username)
        {
            try
            {
                IQueryable<Profile> query = context.Set<Profile>().Where(e => e.IsDeleted == 0);

                query = query.Where(e => (e.FirstName.ToUpper() + " " + e.LastName.ToUpper()).Contains(name));

                //remove current user from the list
                query = query.Where(e => e.UserName != username);

                IList<ProfileDTO> list = new List<ProfileDTO>();
                foreach (var model in query.ToList())
                {
                    list.Add(ModelMapper.ConvertProfileToDTO(model));
                }

                return list;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public IEnumerable<ProfileDTO> GetAll()
        {
            try
            {
                var ls = context.Profiles.Where(e => e.IsDeleted == 0).Include("UserDesignation").ToList();
                var returnObj = new List<ProfileDTO>();

                foreach (var obj in ls)
                {
                    returnObj.Add(ModelMapper.ConvertProfileToDTO(obj));
                }

                return returnObj;
            }
            catch (Exception)
            {
                throw;
            }
        }


        public string UpdateProfileStatus(string Status, Profile User)
        {
            try
            {
                var StatusObj = context.Status.FirstOrDefault(e => e.Content.Equals(Status.ToLower()));

                if (StatusObj == null)
                {
                    return "";
                }

                User.StatusId = StatusObj.Id;
                context.SaveChanges();

                return StatusObj.Content;
            }
            catch (Exception)
            {
                throw;
            }
        }

        //get user by filter
        public Profile GetUser(Expression<Func<Profile, bool>> filter, bool tracked = true)
        {
            try
            {
                Profile user;
                if (tracked)
                {
                    user = context.Profiles.Include("UserStatus").Include("UserDesignation").FirstOrDefault(filter);
                }
                else
                {
                    user = context.Profiles.Include("UserStatus").Include("UserDesignation").AsNoTracking().FirstOrDefault(filter);
                }

                if (user.IsDeleted == 1) { return null; }
                return user;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public int GetIdFromUsername(string username)
        {
            try
            {
                var user = GetUser(e => e.UserName == username && e.IsDeleted == 0);
                if (user == null)
                {
                    return -1;
                }
                return user.Id;
            }
            catch (Exception)
            {
                throw;
            }
        }
        #endregion
    }
}

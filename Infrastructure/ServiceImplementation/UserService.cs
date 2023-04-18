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
            //check if username is valid or not
            var user = GetUser(e => e.UserName == username); 

            if (user == null)
            {
                return null;
            }

            //check if other user with this mail already exists
            var user2 = GetUser(e => e.Email == updateModel.Email, tracked: false);

            if (user2.UserName != user.UserName)
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

            user.FirstName = updateModel.FirstName;
            user.LastName = updateModel.LastName;
            user.Status = updateModel.Status;
            user.LastUpdatedAt = DateTime.Now;

            context.Profiles.Update(user);
            context.SaveChanges();

            return user;
        }

        public IEnumerable<ProfileDTO> GetAll(string name, string username)
        {
            IQueryable<Profile> query = context.Set<Profile>();

            query = query.Where(e => (e.FirstName.ToUpper() + " " + e.LastName.ToUpper()).StartsWith(name));

            //remove current user from the list
            query = query.Where(e => e.UserName != username);

            IList<ProfileDTO> list = new List<ProfileDTO>();
            foreach (var model in query.ToList())
            {
                list.Add(ModelMapper.ConvertProfileToDTO(model));
            }

            return list;
        }

        public IEnumerable<ProfileDTO> GetAll()
        {
            var ls = context.Profiles.ToList();
            var returnObj = new List<ProfileDTO>();

            foreach(var obj in ls)
            {
                returnObj.Add(ModelMapper.ConvertProfileToDTO(obj));
            }

            return returnObj;
        }

        //get user by filter
        public Profile GetUser(Expression<Func<Profile, bool>> filter, bool tracked = true)
        {
            Profile user;
            if (tracked)
            {
                user = context.Profiles.FirstOrDefault(filter);
            }
            else
            {
                user = context.Profiles.AsNoTracking().FirstOrDefault(filter);
            }

            return user;
        }

        public int GetIdFromUsername(string username)
        {
            var user = GetUser(e => e.UserName == username);
            if(user == null)
            {
                return -1;
            }
            return user.Id;
        }
        #endregion
    }
}

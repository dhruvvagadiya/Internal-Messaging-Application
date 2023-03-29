using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace ChatApp.Infrastructure.ServiceImplementation
{
    public class ProfileService : IProfileService
    {
        private readonly ChatAppContext context;

        public ProfileService(ChatAppContext context)
        {
            this.context = context;
        }
        public Profile CheckPassword(LoginModel model)
        {
            return this.context.Profiles.FirstOrDefault(x => model.Password == x.Password
            && (x.Email.ToLower().Trim() == model.EmailAddress.ToLower().Trim() || x.UserName.ToLower().Trim() == model.Username.ToLower().Trim()));
        }

        public Profile RegisterUser(RegisterModel regModel)
        {
            Profile newUser = null;
            if (!CheckEmailOrUserNameExists(regModel.UserName, regModel.Email))
            {
                newUser = new Profile
                {
                    FirstName = regModel.FirstName,
                    LastName = regModel.LastName,
                    Password = regModel.Password,
                    UserName = regModel.UserName,
                    Email = regModel.Email,
                    CreatedAt = DateTime.UtcNow,
                    ProfileType = ProfileType.User
                };
                context.Profiles.Add(newUser);
                context.SaveChanges();
            }
            return newUser;
        }

        public Profile UpdateUser(UpdateModel updateModel, string username)
        {
            //check if username is valid or not
            var user = this.context.Profiles.AsNoTracking().FirstOrDefault(e => e.UserName == username);

            if (user == null)
            {
                return null;
            }

            //check if other user with this mail already exists
            var user2 = this.context.Profiles.AsNoTracking().FirstOrDefault(e => e.Email == updateModel.Email);

            if(user2.UserName != user.UserName)
            {
                return new Profile();
            }


            if (updateModel.File != null)
            {
                var file = updateModel.File;

                var folderName = Path.Combine("Resources", "Images");  // Resources/Images
                var pathToSave = Path.Combine(Directory.GetCurrentDirectory(), folderName); // C:...

                string fileName = Guid.NewGuid().ToString(); //new generated name of the file
                var extension = Path.GetExtension(file.FileName); // extension of the file


                //delete old image to update with new one
                if(user.ImageUrl != null) {
                    if (System.IO.File.Exists(user.ImageUrl))
                    {
                        System.IO.File.Delete(user.ImageUrl);
                    }
                }

                var dbPath = Path.Combine(pathToSave, fileName + extension);
                using (var fileStreams = new FileStream(dbPath, FileMode.Create))
                {
                    file.CopyTo(fileStreams);
                }

                //update image url
                user.ImageUrl = dbPath;

            }

            user.FirstName = updateModel.FirstName;
            user.LastName = updateModel.LastName;

            context.Profiles.Update(user);
            context.SaveChanges();

            return user;
        }

        //get user by filter
        public Profile GetUser(Expression<Func<Profile, bool>> filter)
        {
            return context.Profiles.FirstOrDefault(filter);
        }

        private bool CheckEmailOrUserNameExists(string userName, string email)
        {
            return context.Profiles.Any(x => x.Email.ToLower().Trim() == email.ToLower().Trim() || x.UserName.ToLower().Trim() == userName.ToLower().Trim());
        }

    }
}

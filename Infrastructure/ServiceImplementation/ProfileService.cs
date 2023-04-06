using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Models.Auth;
using ChatApp.Models.Users;
using Microsoft.AspNetCore.Hosting;
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

        public ProfileService(ChatAppContext context, IWebHostEnvironment hostEnvironment)
        {
            this.context = context;
        }
        public Profile CheckPassword(LoginModel model, out string curSalt)
        {
            curSalt = "";

            //get user
            var user = this.context.Profiles.FirstOrDefault(x => x.Email.ToLower().Trim() == model.EmailAddress.ToLower().Trim() || x.UserName.ToLower().Trim() == model.Username.ToLower().Trim());

            if (user == null) return null;

            //if user exists then get salt
            curSalt = context.Salts.FirstOrDefault(e => e.UserId == user.Id).UsedSalt;

            return user;
        }

        //set last seend when user is logged out
        public void HandleLogout(string username)
        {
            var user = context.Profiles.FirstOrDefault(e => e.UserName == username);
            if(user == null) return;

            user.LastSeen = DateTime.Now;
            context.Update(user);
            context.SaveChanges();
        }

        public Profile RegisterUser(RegisterModel regModel, string salt)
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

                newUser.LastUpdatedAt = DateTime.Now;
                
                //add profile to db
                context.Profiles.Add(newUser);
                context.SaveChanges();

                //add salt to db
                context.Salts.Add(new Salt()
                {
                    UsedSalt = salt,
                    UserId = newUser.Id
                });
                context.SaveChanges();
            }
            return newUser;
        }

        private bool CheckEmailOrUserNameExists(string userName, string email)
        {
            return context.Profiles.Any(x => x.Email.ToLower().Trim() == email.ToLower().Trim() || x.UserName.ToLower().Trim() == userName.ToLower().Trim());
        }

    }
}

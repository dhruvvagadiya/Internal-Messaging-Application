using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Hubs;
using ChatApp.Models.Auth;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ChatApp.Infrastructure.ServiceImplementation
{
    public class ProfileService : IProfileService
    {
        #region Private fields
        private readonly ChatAppContext context;
        #endregion

        #region Constructor
        public ProfileService(ChatAppContext context, IWebHostEnvironment hostEnvironment)
        {
            this.context = context;
        }
        #endregion

        #region Methods
        public Profile CheckPassword(string UserName, out string curSalt)
        {
            curSalt = "";

            //get user
            var user = this.context.Profiles.Include("UserDesignation").Include("UserStatus").FirstOrDefault(x => x.Email.ToLower().Trim() == UserName.ToLower().Trim() || x.UserName.ToLower().Trim() == UserName.ToLower().Trim());

            if (user == null) return null;

            //if user exists then get salt
            curSalt = context.Salts.FirstOrDefault(e => e.UserId == user.Id).UsedSalt;

            user.StatusId = 1;
            context.SaveChanges();

            return user;
        }

        public void ChangePassword(string salt, string NewPassword, Profile User)
        {
            //change password
            User.Password = NewPassword;

            context.Update(User);

            //update salt from db
            var saltObj = context.Salts.FirstOrDefault(e => e.UserId == User.Id);
            saltObj.UsedSalt = salt;

            context.Update(saltObj);

            context.SaveChanges();
        }

        public Profile GoogleLogin(IEnumerable<Claim> claims)
        {
            string email = claims.FirstOrDefault(c => c.Type == "email")?.Value;

            //check if already registered
            var User = context.Profiles.FirstOrDefault(e => e.UserName.Equals(email));

            if (User.Password != null) return null;
            if (User != null) return User;

            //register user
            var profile = new Profile()
            {
                Email = email,
                UserName = email,
                FirstName = claims.FirstOrDefault(c => c.Type == "given_name")?.Value,
                LastName = claims.FirstOrDefault(c => c.Type == "family_name")?.Value,
                DesignationId = 1,
                StatusId = 1,
                ProfileType = ProfileType.User,
                CreatedAt = DateTime.UtcNow
            };
            profile.LastUpdatedAt = profile.CreatedAt;

            context.Profiles.Add(profile);
            context.SaveChanges();

            return profile;
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
                    ProfileType = ProfileType.User,
                    StatusId = 1,
                    DesignationId = regModel.DesignationId
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

                //add designation obj
                newUser.UserDesignation = context.Designations.First(e => e.Id == newUser.DesignationId);
            }
            return newUser;
        }

        private bool CheckEmailOrUserNameExists(string userName, string email)
        {
            return context.Profiles.Any(x => x.Email.ToLower().Trim() == email.ToLower().Trim() || x.UserName.ToLower().Trim() == userName.ToLower().Trim());
        }

        #endregion
    }
}

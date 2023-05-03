using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Models.Auth;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

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
            try
            {
                curSalt = "";
                //get user
                var user = this.context.Profiles.Include("UserDesignation").Include("UserStatus").FirstOrDefault(x => (x.Email.ToLower().Trim() == UserName.ToLower().Trim() || x.UserName.ToLower().Trim() == UserName.ToLower().Trim()) && x.IsDeleted == 0);

                if (user == null) return null;

                //if user exists then get salt
                curSalt = context.Salts.FirstOrDefault(e => e.UserId == user.Id).UsedSalt;

                //online
                user.StatusId = 1;
                context.SaveChanges();

                return user;
            }
            catch(Exception e)
            {
                throw;
            }
        }

        public void ChangePassword(string salt, string NewPassword, Profile User)
        {
            try
            {
                //change password
                User.Password = NewPassword;

                context.Update(User);

                //update salt from db
                var saltObj = context.Salts.FirstOrDefault(e => e.UserId == User.Id);

                if(saltObj != null)
                {
                    saltObj.UsedSalt = salt;
                    context.Update(saltObj);
                }
                else
                {
                    saltObj = new Salt()
                    {
                        UsedSalt = salt,
                        UserId = User.Id
                    };
                    context.Add(saltObj);
                }

                context.SaveChanges();
            }
            catch (Exception)
            {

                throw;
            }

        }

        public Profile GoogleLogin(GoogleJsonWebSignature.Payload Payload)
        {
            try
            {
                //get mail
                string email = Payload.Email;

                //check if already registered
                var User = context.Profiles.Include("UserStatus").Include("UserDesignation").FirstOrDefault(e => e.Email.Equals(email));

                //if user has registered with custom email and password
                if (User != null && User.Password != null) return null;
                if (User != null)
                {
                    User.StatusId = 1;  //online
                    context.SaveChanges();
                    return User;
                }
                //register user
                var profile = new Profile()
                {
                    Email = email,
                    UserName = email,
                    FirstName = Payload.GivenName,
                    LastName = Payload.FamilyName,
                    DesignationId = 3,
                    StatusId = 1,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = (int)ProfileType.User
                };
                profile.LastUpdatedAt = profile.CreatedAt;
                profile.LastUpdatedBy = (int) ProfileType.User;

                context.Profiles.Add(profile);
                context.SaveChanges();

                profile = GetUserByUsername(profile.UserName);

                return profile;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public Profile RegisterUser(RegisterModel regModel, string salt)
        {
            try
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
                        CreatedBy = ProfileType.User,
                        LastUpdatedBy = ProfileType.User,
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
            catch (Exception)
            {

                throw;
            }
        }

        private bool CheckEmailOrUserNameExists(string userName, string email)
        {
            return context.Profiles.Any(
                x => x.IsDeleted == 0 &&
                (x.Email.ToLower().Trim() == email.ToLower().Trim() || x.UserName.ToLower().Trim() == userName.ToLower().Trim())
                );
        }

        public Profile GetUserByUsername(string UserName)
        {
            return this.context.Profiles.Include("UserDesignation").Include("UserStatus").FirstOrDefault(e => e.UserName == UserName && e.IsDeleted == 0);
        }

        public string GetSalt(int UserId)
        {
            var saltObj = context.Salts.FirstOrDefault(e => e.UserId == UserId);
            if (saltObj == null) return "";
            return saltObj.UsedSalt;
        }
        #endregion
    }
}

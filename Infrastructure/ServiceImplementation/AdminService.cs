using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Hubs;
using ChatApp.Models.Auth;
using ChatApp.Models.Users;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace ChatApp.Infrastructure.ServiceImplementation
{
    public class AdminService : IAdminService
    {
        #region Fields
        private readonly ChatAppContext _context;
        private readonly IHubContext<MessageHub> hubContext;
        private readonly IConfiguration _config;
        #endregion

        #region Constuctor
        public AdminService(ChatAppContext context, IHubContext<MessageHub> hub, IConfiguration config)
        {
            _config = config;
            hubContext = hub;
            _context = context;
        }
        #endregion

        #region Methods
        public IEnumerable<AdminProfileDTO> GetAll()
        {
            var returnObj = _context.Profiles.Where(e => e.IsDeleted == 0).Include("UserDesignation").Select(e => ConvertToDto(e)).ToList();
            return returnObj;
        }

        public AdminProfileDTO AddUser(RegisterModel regModel, string salt)
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
                        CreatedBy = ProfileType.Administrator,
                        LastUpdatedBy = ProfileType.Administrator,
                        StatusId = 1,
                        DesignationId = regModel.DesignationId
                    };

                    newUser.LastUpdatedAt = DateTime.Now;

                    //add profile to db
                    _context.Profiles.Add(newUser);
                    _context.SaveChanges();

                    //add salt to db
                    _context.Salts.Add(new Salt()
                    {
                        UsedSalt = salt,
                        UserId = newUser.Id
                    });

                    _context.SaveChanges();

                }

                if(newUser != null)
                {
                    newUser.UserDesignation = _context.Designations.FirstOrDefault(e => e.Id == newUser.DesignationId);
                    return ConvertToDto(newUser);
                }

                return null;

            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<AdminProfileDTO> UpdateEmployeeDetails(AdminProfileDTO details, Profile User)
        {
            try
            {
                User.FirstName = details.FirstName;
                User.LastName = details.LastName;
                User.Email = details.Email;
                User.DesignationId = details.DesignationId;
                User.LastUpdatedAt = DateTime.Now;
                User.LastUpdatedBy = ProfileType.Administrator;

                _context.Update(User);
                _context.SaveChanges();

                User.UserDesignation = _context.Designations.FirstOrDefault(e => e.Id == User.DesignationId);

                var conn = _context.Connections.FirstOrDefault(e => e.ProfileId == User.Id);
                if(conn != null)
                {
                    await hubContext.Clients.Client(conn.SignalId).SendAsync("updateDetails", GenerateJSONWebToken(User));
                }

                return ConvertToDto(User);
            }
            catch (Exception e)
            {
                throw;
            }
        }

        public async Task<bool> DeleteEmployee(string UserName)
        {
            try
            {
                var User = _context.Profiles.FirstOrDefault(e => e.UserName.Equals(UserName));
                if (User == null) return false;

                User.IsDeleted = 1;
                _context.SaveChanges();


                var conn = _context.Connections.FirstOrDefault(e => e.ProfileId == User.Id);
                if (conn != null)
                {
                    await hubContext.Clients.Client(conn.SignalId).SendAsync("deleteUser");
                }

                return true;
            }
            catch(Exception e)
            {
                throw;
            }
        }

        public static AdminProfileDTO ConvertToDto(Profile e)
        {
            return new AdminProfileDTO()
            {
                FirstName = e.FirstName,
                LastName = e.LastName,
                UserName = e.UserName,
                Email = e.Email,
                Designation = e.UserDesignation.Role,
                ImageUrl = e.ImageUrl 
            };
        }

        #endregion


        #region Private Methods
        private bool CheckEmailOrUserNameExists(string userName, string email)
        {
            return _context.Profiles.Any(
                x => x.IsDeleted == 0 &&
                (x.Email.ToLower().Trim() == email.ToLower().Trim() || x.UserName.ToLower().Trim() == userName.ToLower().Trim())
                );
        }

        private string GenerateJSONWebToken(Profile profileInfo)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[] {
                    new Claim(JwtRegisteredClaimNames.Sub, profileInfo.UserName),
                    new Claim(JwtRegisteredClaimNames.Email, profileInfo.Email),
                    new Claim(ClaimsConstant.FirstNameClaim, profileInfo.FirstName),
                    new Claim(ClaimsConstant.LastNameClaim, profileInfo.LastName),
                    new Claim(ClaimsConstant.DesignationClaim, profileInfo.UserDesignation.Role),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(_config["Jwt:Issuer"],
                _config["Jwt:Issuer"],
                claims,
                expires: DateTime.Now.AddMinutes(120),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        #endregion
    }
}

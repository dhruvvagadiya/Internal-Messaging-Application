using ChatApp.Business.Helpers;
using ChatApp.Business.ServiceInterfaces;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using ChatApp.Models.Users;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ChatApp.Infrastructure.ServiceImplementation
{
    public class AdminService : IAdminService
    {
        private readonly ChatAppContext _context;

        public AdminService(ChatAppContext context)
        {
            _context = context;
        }
        public IEnumerable<AdminProfileDTO> GetAll()
        {
            var returnObj = _context.Profiles.Where(e => e.IsDeleted == 0).Include("UserDesignation").Select(e => ConvertToDto(e)).ToList();
            return returnObj;
        }

        public AdminProfileDTO UpdateEmployeeDetails(AdminProfileDTO details, Profile User)
        {
            User.FirstName = details.FirstName;
            User.LastName = details.LastName;
            User.Email = details.Email;
            User.DesignationId = details.DesignationId;
            User.LastUpdatedAt = DateTime.Now;
            User.LastUpdatedBy = (int) ProfileType.Administrator;

            _context.Update(User);
            _context.SaveChanges();

            User.UserDesignation = _context.Designations.FirstOrDefault(e => e.Id == User.DesignationId);

            return ConvertToDto(User);
        }

        public bool DeleteEmployee(string UserName)
        {
            var User = _context.Profiles.FirstOrDefault(e => e.UserName.Equals(UserName));
            if (User == null) return false;

            User.IsDeleted = 1;
            _context.SaveChanges();

            return true;
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
    }
}

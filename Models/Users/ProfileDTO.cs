using ChatApp.Business.Helpers;
using System;
using System.ComponentModel.DataAnnotations;

namespace ChatApp.Models.Users
{
    public class ProfileDTO
    {
        //public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string ImageUrl { get; set; }
        public ProfileType ProfileType { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
        public int? LastUpdatedBy { get; set; }
    }
}

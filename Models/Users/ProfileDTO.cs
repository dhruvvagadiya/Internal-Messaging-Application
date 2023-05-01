using ChatApp.Business.Helpers;
using System;

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
        public string Designation { get; set; }

        public Boolean IsGoogleUser { get; set; } = false;

        public string ProfileStatus { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
        public int? LastUpdatedBy { get; set; }
        public DateTime? LastSeen { get; set; }
    }
}

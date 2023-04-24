using System;

namespace ChatApp.Models.Group
{
    public class GroupMemberDTO
    {
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string ImageUrl { get; set; }
        public DateTime AddedAt { get; set; }
    }
}

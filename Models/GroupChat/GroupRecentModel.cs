using ChatApp.Models.Group;
using System;

namespace ChatApp.Models.GroupChat
{
    public class GroupRecentModel
    {
        public GroupDTO Group { get; set; }
        public DateTime LastMsgTime { get; set; }
        public string LastMessage { get; set; }
        public string FirstName { get; set; }  //sender of last message
        public string LastName { get; set; }
        public string ImageUrl { get; set; }
    }
}

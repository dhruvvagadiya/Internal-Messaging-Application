using System;

namespace ChatApp.Models.Chat
{
    public class RecentChatModel
    {
        public DateTime? LastMsgTime { get; set; }
        public string LastMessage { get; set; }
        public int UnseenCount { get; set; }

        //no need to pass complete user data
        public string UserName { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string ImageUrl { get; set; }
    }
}

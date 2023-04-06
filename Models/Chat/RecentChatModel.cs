using ChatApp.Models.Users;
using System;

namespace ChatApp.Models.Chat
{
    public class RecentChatModel
    {
        public DateTime? LastMsgTime { get; set; }
        public string LastMessage { get; set; }
        public int UnseenCount { get; set; }
        public ProfileDTO User { get; set; }
    }
}


using System;

namespace ChatApp.Context.EntityClasses
{
    public class Notification
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string Content { get; set; }
        public string Type { get; set; }
        public int IsSeen { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

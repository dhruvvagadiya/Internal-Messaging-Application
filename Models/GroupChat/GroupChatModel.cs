using System;

namespace ChatApp.Models.GroupChat
{
    public class GroupChatModel
    {
        public int Id { get; set; }
        public int GroupId { get; set; }

        //user Data
        public string MessageFrom { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string ImageUrl { get; set; }
        
        public string Type { get; set; }
        public string Content { get; set; }
        public string FilePath { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        //content of parent msg
        public string? RepliedTo { get; set; }

    }
}

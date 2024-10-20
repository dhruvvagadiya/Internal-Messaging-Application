using System;

namespace ChatApp.Models.Chat
{
    public class ChatModel
    {
        public int Id { get; set; }
        public string MessageFrom { get; set; }
        public string MessageTo { get; set; }
        public string Type { get; set; }
        public string Content { get; set; }
        public string FilePath { get; set; }
        public DateTime CreatedAt { get; set; }
        //content of parent msg
        public string? RepliedTo { get; set; }
        public int? SeenByReceiver { get; set; }

    }
}

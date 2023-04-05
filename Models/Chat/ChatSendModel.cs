using System.ComponentModel.DataAnnotations;

namespace ChatApp.Models.Chat
{
    public class ChatSendModel
    {
        [Required]
        public string Sender { get; set; }
        [Required]
        public string Receiver { get; set; }
        [Required]
        public string Type { get; set; }
        [Required]
        public string Content { get; set; }

        public int? RepliedTo { get; set; }
    }
}

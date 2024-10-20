using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace ChatApp.Models.Chat
{
    public class ChatSendModel
    {
        [Required]
        public string Receiver { get; set; }
        [Required]
        public string Type { get; set; }

        public string Content { get; set; }

        public IFormFile? File { get; set; }

        [AllowNull]
        public int? RepliedTo { get; set; }
    }
}

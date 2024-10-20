using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.CodeAnalysis;

namespace ChatApp.Models.GroupChat
{
    public class GroupChatSendModel
    {
        public string Sender { get; set; }
        [Required]
        public int GroupId { get; set; }
        [Required]
        public string Type { get; set; }
        //[Required]
        public string Content { get; set; }

        public IFormFile? File { get; set; }

        [AllowNull]
        public int? RepliedTo { get; set; }
    }
}

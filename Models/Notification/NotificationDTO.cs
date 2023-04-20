using System;
using System.ComponentModel.DataAnnotations;

namespace ChatApp.Models.Notification
{
    public class NotificationDTO
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Content { get; set; }
        [Required]
        [MaxLength(10)]

        public string Type { get; set; }
        public int IsSeen { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

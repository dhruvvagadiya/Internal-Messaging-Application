using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApp.Context.EntityClasses.Group
{
    public class GroupChat
    {
        public int Id { get; set; }

        public string Type { get; set; }
        public string Content { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int? RepliedTo { get; set; }


        //foreign keys
        [ForeignKey("Group")]
        public int GroupId { get; set; }
        public Group Group { get; set; }

        [ForeignKey("MessageFromUser")]
        public int MessageFrom { get; set; }
        public virtual Profile MessageFromUser { get; set; }
    }
}

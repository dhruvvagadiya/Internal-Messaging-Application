using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApp.Context.EntityClasses.Group
{
    public class GroupMember
    {
        public int Id { get; set; }
        public DateTime AddedAt { get; set; }

        //foreign keys
        [ForeignKey("Group")]
        public int GroupId { get; set; }
        public Group Group { get; set; }

        [ForeignKey("User")]
        public int UserId { get; set; }
        public virtual Profile User { get; set; }
    }
}

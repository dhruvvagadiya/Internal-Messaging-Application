using ChatApp.Business.Helpers;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApp.Context.EntityClasses
{
    public class Profile
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string ImageUrl { get; set; }
        public string Password { get; set; }

        [ForeignKey("UserDesignation")]
        public int DesignationId { get; set; }
        public virtual Designation UserDesignation { get; set; }

        [ForeignKey("UserStatus")]
        public int StatusId { get; set; } = 1;
        public virtual Status UserStatus { get; set; }
        public DateTime? CreatedAt { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? LastUpdatedAt { get; set; }
        public int? LastUpdatedBy { get; set; }
        public int IsDeleted { get; set; }

    }
}

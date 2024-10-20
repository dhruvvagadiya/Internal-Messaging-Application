using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ChatApp.Models.Group
{
    public class CreateGroup
    {

        public int? GroupId { get; set; }
        public string UserName { get; set; }

        [Required]
        [MinLength(5, ErrorMessage = "Group name must contain minimum 5 characters")]
        [MaxLength(50, ErrorMessage = "Maximum length for group name is 50 characters")]
        public string GroupName { get; set; }

        [MaxLength(50, ErrorMessage = "Maximum length for group description is 50 characters")]
        public string Description { get; set; }

        public IFormFile? ProfileImage { get; set; }
    }
}

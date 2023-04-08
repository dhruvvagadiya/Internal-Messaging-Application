using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ChatApp.Models.Users
{
    public class UpdateModel
    {
        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }

        [Required]
        [EmailAddress(ErrorMessage = "Please enter valid email address")]
        public string Email { get; set; }

        [Required]
        [MaxLength(50, ErrorMessage ="Status must be less than 50 characters")]
        public string Status { get; set; }
        public IFormFile File { get; set; }
    }
}

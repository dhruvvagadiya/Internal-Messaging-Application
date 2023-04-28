using System.ComponentModel.DataAnnotations;

namespace ChatApp.Models.Auth
{
    public class ChangePasswordModel
    {
        public string CurrentPassword { get; set; }
        [Required]
        [MinLength(8, ErrorMessage ="Password must be 8 characters long!")]
        public string Password { get; set; }
    }
}

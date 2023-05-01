using System.ComponentModel.DataAnnotations;

namespace ChatApp.Models.Auth
{
    public class LoginModel
    {
        [Required]
        public string Username { get; set; }
        [Required]
        public string EmailAddress { get; set; }
        [Required]
        public string Password { get; set; }
    }
}

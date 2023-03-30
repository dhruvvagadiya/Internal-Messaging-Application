using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ChatApp.Models
{
    public class LoginModel
    {
        [Required]
        public string Username { get; set; }
        [Required]
        [RegularExpression(@"^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$", ErrorMessage = "Please enter valid email address")]
        public string EmailAddress { get; set; }
        [Required]
        public string Password { get; set; }
    }
}

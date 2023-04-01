using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ChatApp.Models.Auth
{
    public class LoginModel
    {
        [Required]
        public string Username { get; set; }
        [Required]
        [EmailAddress(ErrorMessage ="Please enter valid email address")]
        public string EmailAddress { get; set; }
        [Required]
        public string Password { get; set; }
    }
}

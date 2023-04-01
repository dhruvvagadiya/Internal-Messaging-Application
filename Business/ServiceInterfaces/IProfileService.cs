using ChatApp.Context.EntityClasses;
using ChatApp.Models.Auth;
using ChatApp.Models.Users;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace ChatApp.Business.ServiceInterfaces
{
    public interface IProfileService
    {
        Profile CheckPassword(LoginModel loginModel);

        Profile RegisterUser(RegisterModel regModel);

    }
}

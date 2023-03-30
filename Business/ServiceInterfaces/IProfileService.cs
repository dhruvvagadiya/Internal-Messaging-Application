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

        Profile UpdateUser(UpdateModel updateModel, string username);

        Profile GetUser(Expression<Func<Profile, bool>> filter, bool tracked);

        IEnumerable<ProfileDTO> GetAll(string name, string username);
    }
}

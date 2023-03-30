using ChatApp.Context.EntityClasses;
using ChatApp.Models;
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

        IEnumerable<GetUserModel> GetAll(string name, string username);
    }
}

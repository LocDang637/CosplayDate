using CosplayDate.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CosplayDate.Application.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        DateTime GetTokenExpiration();
    }
}

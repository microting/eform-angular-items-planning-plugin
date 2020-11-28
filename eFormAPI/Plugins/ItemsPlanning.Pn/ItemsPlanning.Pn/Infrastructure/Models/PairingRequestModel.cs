using System.Collections.Generic;

namespace ItemsPlanning.Pn.Infrastructure.Models
{
  public class PairingRequestModel
  {
    public List<int> TagIds { get; set; }
      = new List<int>();
  }
}

using System.Collections.Generic;

namespace UmbracoBulkEdit.Models
{
    public class Property
    {
        public string Alias { get; set; }

        public string Value { get; set; }
    }

    public class Node
    {
        public int Id { get; set; }

        public IEnumerable<Property> Properties { get; set; } 

    }
}
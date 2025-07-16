namespace CosplayDate.Application.DTOs.Review
{
    public class ToggleHelpfulResponseDto
    {
        public int ReviewId { get; set; }
        public bool IsHelpful { get; set; }
        public bool IsToggled { get; set; }  // true if voted, false if removed vote
        public int HelpfulCount { get; set; }
    }
}

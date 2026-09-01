namespace MiserGameCore
{
    public sealed class MiserOutputArgs
    {
        public string Text { get; internal set; }
        public bool IsError { get; internal set; }
        public bool End { get; internal set; }

        internal void Reset()
        {
            Text = "";
            IsError = false;
            End = false;
        }
    }
}

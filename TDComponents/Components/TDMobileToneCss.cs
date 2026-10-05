namespace TDComponents;

internal static class TDMobileToneCss
{
    public static string Class(TDMobileTone tone) => tone switch
    {
        TDMobileTone.Success => "is-ok",
        TDMobileTone.Warning => "is-warn",
        TDMobileTone.Danger => "is-bad",
        _ => "is-neutral"
    };
}

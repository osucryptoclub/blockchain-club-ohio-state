/**
 * Decides before first paint whether the introduction plays, so the page never
 * flashes underneath it. The logo links to ?intro, which always plays it,
 * except under reduced motion. If the app fails to start, the cover lifts by itself.
 */
const script = `(function(d){try{
var again=/[?&]intro\\b/.test(location.search);
if(location.pathname!=="/"||location.hash)return;
if(matchMedia("(prefers-reduced-motion: reduce)").matches){if(again)history.replaceState(null,"",location.pathname);return}
if(!again&&sessionStorage.getItem("intro"))return;
if(!again&&navigator.connection&&navigator.connection.saveData)return;
d.dataset.intro="boot";
setTimeout(function(){if(d.dataset.intro==="boot"){delete d.dataset.intro;dispatchEvent(new Event("intro:out"))}},6000);
}catch(e){}})(document.documentElement)`;

export function IntroScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

// `elevation` is Android-only - React Native ignores it on iOS, so every
// "elevated" card/header in this app rendered completely flat on iPhone.
// Spread this alongside (or instead of) a bare `elevation: N` to get a
// matching iOS shadow from the same single number.
export const shadow = (elevation = 2) => ({
  elevation,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: Math.ceil(elevation / 2) },
  shadowOpacity: 0.1 + Math.min(elevation, 10) * 0.01,
  shadowRadius: elevation,
});

// save entered form values
const
  DEF = 'formDefault',
  formDefault = JSON.parse( window.localStorage.getItem( DEF ) ) || {};

// save state
window.addEventListener('beforeunload', () => {
  localStorage.setItem(DEF, JSON.stringify( formDefault ));
});

// record input change
document.body.addEventListener('change', e => {

  const
    t = e && e.target,
    name = t && t.name;

  if (name && t.value && t.autocomplete !== 'off') {
    formDefault[name] = t.value;
  }

});

// restore inputs
for (let name in formDefault) {

  const value = formDefault[name];
  Array
    .from( document.getElementsByName( name ) )
    .forEach( f => {
      if (f.autocomplete !== 'off') {
        f.value = value;
      }
    });

}

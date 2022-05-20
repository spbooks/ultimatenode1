// utility functions

// clear children of DOM element
export function clear( node ) {
  while ( node.lastChild ) node.removeChild( node.lastChild );
}

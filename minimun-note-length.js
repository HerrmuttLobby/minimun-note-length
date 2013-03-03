// TODO : test more the "immediate", may we need in all functions ?


// theoretically tells max to watch and compile file automatically
autowatch = 1;

// TODO: output return of queried data over outlet 2
outlets   = 2;

// array( aka table ) of notes which are in "on" state
var notes = [];

// reset array which holds notes which are in "on" state
function reset() { notes = []; } 

/** inlet 0 - list

  - receives note and velocity packed in a list
 **/
function list( note, velocity )
{
	// post( "\n" );
	// post( " received list " + [note,velocity] );
	// post( "\n" );
	
	if( velocity == 0 ) {
		on_note_off( note );
	} else {
		on_note_on( note );

		// let the note on freely pass
		outlet( 0, [note, velocity] );
	}
}

// higher priority for this call
list.immediate = 1;

// handles note on event
function on_note_on( note, velocity ) 
{
	// if receives note on before sending scheduled note off message
	if( notes[note] !== undefined ) {

		// send a note off instantly ( which stops the scheduler for note off )
		send_note_off( note );
	}

	notes[note] = { time : Date.now() };
}

// handles note off event	
function on_note_off( note ) 
{
	var duration;
	
	time     = Date.now();
	duration = parseInt( time - notes[note].time, 10 );
		
	if( duration < get_min_length() ) {

		delay( get_min_length() - duration, note );

	} else {

		send_note_off( note );

	}
}

// schedules a note off message to happen in defined delay time
// in milliseconds.
function delay( delay, note ) 
{

	// post( "\n" );
	// post( "--- delaying " + note + " by " + delay + " ms " );
	// post( "\n" );

	task = new Task( function( note ) {  

		return send_note_off( note );
		
	}, this, [ note ] );

	task.schedule( delay );

	notes[note].task = task;
}

// get minimun length from knob via "script name"
function get_min_length() {
	return parseInt( this.patcher.getnamed( 'min_length' ).getvalueof(), 10 );
}

// send_note_offs a list prepared for 
function send_note_off( note ) 
{
	// stop the scheduler for note off - if there's one
	if( notes[note].task ) notes[note].task.cancel();

	// free note slot
	delete notes[note].task;
	delete notes[note];

	// post( "\n" );
	// post( " --> sending note off " + note );
	// post( "\n" );

	outlet( 0, note, 0 );
}
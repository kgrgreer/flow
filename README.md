FLOW, the FOAM Live Object Workspace is an experimental cross between a paint program and a spreadsheet.
Rather than just creating static pictures or diagrams, the attributes of elements making up a picture can
be scripted with reactive formulas, just like with a spreadsheet cell. Thus stack images can be brought to life
to form animations, games, simulations or interactive infographics.

# Videos
This video show the main paint-program / workspace features (developed in exactly one week):

https://drive.google.com/file/d/1YhGs1UPHUq39n0M5YIl_2XT9iocUjvuf/view?usp=sharing

This video shows 2D and 3D Turtle graphics:

https://www.youtube.com/watch?v=4wO_RrftJTE

FLOW is written in [FOAM](http://foamdev.com) and this video shows the reactive programming features of FOAM:

https://www.youtube.com/watch?v=-fbq-_H6Lf4

# Workspace types:
1. 2D Canvas
2. Simple Spreadsheet - A conventional spreadsheet.
3. Calculator - Like a 1-dimensional spreadsheet that resembles a more conventional calculator but with the advantage that if you update a value, then all dependent values will also update.

Future workspace types could include things like a 3D world, databases, text documents, slide-shows, graphs, animation timelines, musical scores or any number of other types of containers.

# Turtle Graphics
FLOW supports conventional Logo-like turtle graphics, but with a few extensions:
1. Not limited to just line-based graphics, but the turtle can "lay" objects along its path, and those objects can be live, making it more suitable for creating games and animations.
2. In addition to the regular 2D turtle, there is also a 3D turtle which adds a whole new dimension to turtle graphics. The turtle can also move up and down and pitch and roll to move through 3D space. This makes 3D graphics more accessible as it doesn't require any advanced mathematics.
3. New turtles can be spawned to demonstrate concurrency. 

# Goals
1. Create an education environment, primarily aimed at children, for learning programming.
2. Actually create a useful tool for creating diagrams, animations, simulations and simple database applications.

# History
FLOW was originally created as an experimental sub-project of the [FOAM2](https://github.com/foam-framework/foam2) framework at Google. This project forked from that original project, but is no longer associated with Google.

# Installation
To run flow, first clone the FOAM3 repository:

    $ git clone https://github.com/kgrgreer/flow.git

Then start the NANOS server:

    $ ./build.sh

Then point your web browser to:

    http://localhost:8080/flow.html
    
# Source Code
[https://github.com/kgrgreer/foam3/tree/development/src/com/google/flow](https://github.com/kgrgreer/flow/tree/main/src/com/google/flow)

# Related
[Potluck - Dynamic documents as personal software](https://www.inkandswitch.com/potluck/)

[Sketch-n-Sketch - Programming + Direct Manipulation + HTML/SVG](https://ravichugh.github.io/sketch-n-sketch/)

[Logo Programming Language](https://en.wikipedia.org/wiki/Logo_(programming_language))

[Squeak Smalltalk](https://squeak.org/)

[Recursive Drawing](http://recursivedrawing.com/)

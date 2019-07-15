function Queue() {
	this.head = null
	this.tail = null
}

function QueueNode(elt) {
	this.elt = elt;
	this.next = null;
	this.prev = null;
}

Queue.prototype.push = function(elt) {
	const n = new QueueNode(elt);
	if (this.head === null) {
		this.head = n;
		this.tail = n;
	} else {
		this.tail.next = n;
		this.tail = n;
	}
}

Queue.prototype.poll = function(elt) {
	if (this.head === null) { return null; }
	const n = this.head;
	this.head = this.head.next;
	if (this.head === null) { this.tail = null; }
	return n.elt;
}

Queue.prototype.empty = function() {
	return this.head === null;
}
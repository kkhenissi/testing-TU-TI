import { VoteComponent } from './vote.component'; 

describe('VoteComponent', () => {
  // Arrange for both
  let component: VoteComponent;
  beforeEach(() => {
    component = new VoteComponent;
  })


  it('should increment totalVotes when upvoted', () => {
    // Arrange
   

    // Action
    component.upVote();

    // Assert
    expect(component.totalVotes).toBe(1);
  });

  it('should decrement totalVotes when downvoted', () => {
    // Arrange
    

    // Action
    component.downVote;

    // Assert
    expect(component.totalVotes).toBe(-1);
  });

 
import {greet } from './greet';
describe('greet', () => {
     it('should include the name in the message ', () => {
        expect(greet('kkhenissi')).toContain('kkhenissi');
                                  // toBe('Welcome kkhenissi');
     })
});
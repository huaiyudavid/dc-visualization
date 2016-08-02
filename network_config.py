
class NetworkConfig:
    def __init__(self, fileName):
        self.sessions = []
        file = open(fileName, 'r')
        for line in file:
            session = dict()
            words = line.split(' ')
            session['model'] = words[0].strip()
            comm = words[2].strip()
            if 'minmaj' in comm:
                comm = comm[-2:]
                globalComm = comm[0] == 'G'
                localComm = comm[1] == 'L'
                if globalComm:
                    comm = 'Global + '
                if localComm:
                    comm += 'Local'
                else:
                    comm += 'None'
            session['communication'] = comm
            self.sessions.append(session)


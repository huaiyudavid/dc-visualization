from experiment import Experiment
from network_config import NetworkConfig
from datetime import datetime as Time

""" find_player
given the player id, gets the player object from the players array
"""
def find_player(players, id):
    for player in players:
        if player['id'] == str(id):
            return player

""" make_nodes
creates the nodes portion of the state object
"""
def make_nodes(players, nodes, has_messages, messages):
    json = '['
    for i in range(len(nodes)): #nodes, has_messages, and messages have the same length
        node = nodes[i]
        message = messages[i]
        has_message = has_messages[i]
        player = find_player(players, i)
        json += '{'
        json += ('\"id\": \"' + str(i) + '\",')
        json += ('\"name\": \"' + player['name'] + '\",')
        json += ('\"username\": \"' + player['username'] + '\",')
        json += ('\"preference\": \"' + player['preference'] + '\",')
        json += ('\"communication\": \"' + player['communication'] + '\",')
        json += ('\"isAdversary\": \"' + player['isAdversary'] + '\",')
        json += '\"radiusdelta\": '
        json += ('7' if has_message else '0')
        json += ','
        json += ('\"message\": \"' + message + '\",')
        json += ('\"color\": \"' + node + '\"},')
    json = json[:-1]
    json += ']'
    return json


""" model_states
takes a session and returns a JSON model for its states
"""
def model_states(session):
    json = '['
    players = session['players']
    actions = session['actions']
    nodes = ['w' for x in range(len(players))]   #initialize every node to white
    init_time = session['init time'] + '000'
    format = '%H:%M:%S.%f'
    #print init_time
    d_init_time = Time.strptime(init_time, format)
    for action in actions:
        has_messages = [False for x in range(len(players))]
        messages = ['' for x in range(len(players))]

        i = int(action['player id'])
        time = action['time']
        if len(time) < 12:
            time += ':00.000'
        time += '000'
        #print 'time' + str(time)
        color = action['color']
        has_message = action['message']
        message = action['text']
        if not has_message:
            nodes[i] = 'g' if color == 'green' else 'r'
        has_messages[i] = has_message
        messages[i] = message

        d_time = Time.strptime(time, format)
        td = d_time - d_init_time
        time_string = str(td.seconds//3600).zfill(2) + ':' + str((td.seconds//60)%60).zfill(2) + ':' + str(td.seconds%60).zfill(2) + '.' + str(td.microseconds)

        json += '{'
        json += '\"nodes\": '
        json += make_nodes(players, nodes, has_messages, messages)
        json += ','
        json += ('\"time\": \"' + time_string + '\"},')
    json = json[:-1]
    json += ']'
    return json

""" make_links
creates the links array portion of the session object
"""
def make_links(adj_matrix):
    json = '['
    for i in range(0, len(adj_matrix)):
        for j in range(i, len(adj_matrix[0])):
            if adj_matrix[i][j] == True:
                json += ('{\"source\": \"' + str(i) + '\",')
                json += ('\"target\": \"' + str(j) + '\"},')
    json = json[:-1]
    json += ']'
    return json

def make_info(info, more_info):
    json = '{'
    json += ('\"incentives\": \"' + info['incentives'] + '\",')
    json += ('\"homophilic\": \"' + info['homophilic'] + '\",')
    json += ('\"model\": \"' + more_info['model'] + '\",')
    json += ('\"communication\": \"' + more_info['communication'] + '\",')
    json += ('\"structured\": \"' + info['structured'] + '\"')
    json += '}'

    return json

""" to_json
returns the json representation of the array of sessions, according to format similar to here:
http://flowingdata.com/2012/08/02/how-to-make-an-interactive-network-visualization/
"""
def to_json(sessions, date, network_config):
    json = ''

    print(len(sessions))

    for i in range(len(sessions)):
        session = sessions[i]
        adj_matrix = session['adj matrix']
        #print adj_matrix
        json += '{'
        json += ('\"id\": ' + str(i) + ',')
        json += ('\"states\": ' + model_states(session) + ',')
        json += ('\"links\": ' + make_links(adj_matrix) + ',')
        json += ('\"info\": ' + make_info(session['info'], network_config[i]) + ',')
        json += ('\"date\": ' + date)
        json += '}\n'
    # json = json[:-1]

    return json


def main():
    #date = raw_input('Input Date (yyyymmdd): ')
    date = '20160801'

    #fileName = raw_input('File to load: ')
    #fileName = 'DC_Experiment_' + date[4:6] + '_' + date[6:8] + '_Log_sorted.txt'
    inputFileName = 'network_configuration' + date[4:] + '.txt'
    fileName = '08.01.16_log_sorted.txt'
    #inputFileName = 'NC_test.txt'


    network_config = NetworkConfig(inputFileName)
    experiment = Experiment(fileName)
    print network_config.sessions
    file = open('experiment' + date + '.json', 'w')
    json = to_json(experiment.sessions, date, network_config.sessions)
    file.write(json)
    file.flush()
    file.close()

if __name__ == '__main__':
    main()

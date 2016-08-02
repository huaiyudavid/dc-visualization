class Experiment:
    def __init__(self, fileName):
        lines = self.isolate_experiment(fileName)   #array of each line in log
        self.sessions = []
        #each session stores players, adjacency matrix, and actions
        self.split_sessions(lines)

    def isolate_experiment(self, fileName):
        lines = []
        file = open(fileName, 'r')
        output = open('experiment.txt', 'w')
        start = False
        end = False
        skip = True
        for line in file:
            if skip and not start and ('EXPS1' in line):
                skip = False
            elif not skip and not start and ('EXPS1' in line):
                start = True
                # print 'started'
                output.write(line)
                lines.append(line)

            elif start:  # start = True
                if not end:
                    # print 'not ended yet'
                    output.write(line)
                    lines.append(line)

                    if ('EXPT2' in line):
                        end = True
                        # print 'ended'

        file.close()
        output.flush()
        output.close()

        return lines

    def split_sessions(self, lines):
        hashtag = False
        session_in = False
        session_init = False
        color_assign = False
        matrix = False
        comm_assign = False
        conflict_assign = False     #for incentive conflict parameters
        message_assign = False      #for communication (messaging) parameters
        adversary_assign = False

        process_color = False
        process_message = False

        players = []
        adj_matrix = []
        actions = []
        info = dict()

        time = '0'

        session = None

        for line in lines:
            if 'ITZS1' in line:
                session_init = True
                session = dict()

            elif session_init:
                if '###' in line:
                    #reset most things here
                    if color_assign:
                        session['players'] = players
                        color_assign = False
                    if comm_assign:
                        comm_assign = False
                    if conflict_assign:
                        conflict_assign = False
                    if message_assign:
                        session['info'] = info
                        message_assign = False
                    if adversary_assign:
                        adversary_assign = False
                    if matrix:
                        session['adj matrix'] = adj_matrix
                        matrix = False

                elif 'PYSP2' in line:
                    color_assign = True
                elif color_assign:
                    words = line.split('\t')
                    player_id = words[2].strip()
                    player = next(i for i in players if i['id'] == player_id)
                    red_payout = float(words[3].strip())
                    green_payout = float(words[4].strip())
                    if red_payout > green_payout:
                        player['preference'] = 'red'
                    elif green_payout > red_payout:
                        player['preference'] = 'green'
                    else:
                        player['preference'] = 'none'

                elif 'ADJM1' in line:
                    matrix = True
                    adj_matrix = []
                elif matrix:
                    words = line.split('\t')
                    row = []
                    for word in words[:-1]:
                        row.append(word == 'true')
                    adj_matrix.append(row)

                elif 'INCS1' in line:
                    comm_assign = True
                    #players = []
                elif comm_assign:
                    words = line.split('\t')
                    player_id = words[2].strip()
                    player = next(i for i in players if i['id'] == player_id)
                    #player = dict()
                    #player['username'] = words[0].strip()
                    #player['name'] = words[1].strip()
                    #player['id'] = words[2].strip()
                    player['communication'] = words[3].strip()
                    #players.append(player)

                elif 'ADVR1' in line:
                    adversary_assign = True
                    players = []
                elif adversary_assign:
                    words = line.split('\t')
                    player = dict()
                    player['username'] = words[0].strip()
                    player['name'] = words[1].strip()
                    player['id'] = words[2].strip()
                    player['isAdversary'] = words[3].strip()
                    players.append(player)


                elif 'PRMI3' in line:
                    conflict_assign = True
                    info = dict()
                elif conflict_assign:
                    words = line.split('\t')
                    field = words[0].strip()
                    word = words[1].strip()
                    if field == 'incentivesConflictLevel':
                        info['incentives'] = word
                    else:
                        info['homophilic'] = word

                elif 'PRMM1' in line:
                    message_assign = True
                elif message_assign:
                    words = line.split('\t')
                    field = words[0].strip()
                    word = words[1].strip()
                    if field == 'communication':
                        info['communication'] = word
                    elif field == 'globalCommunication':
                        info['global'] = word
                    else:
                        info['structured'] = word

                elif 'ITZT2' in line:
                    session_init = False
                    session_in = True
                    actions = []

            elif session_in:
                if '###' in line:
                    hashtag = True
                elif hashtag:
                    time = line.strip()
                    hashtag = False

                elif 'SESS1' in line:
                    session['init time'] = time
                elif 'CRQP4' in line:
                    process_color = True
                elif process_color:
                    words = line.split('\t')
                    action = dict()
                    action['player id'] = words[3].strip()
                    action['color'] = words[4].strip()
                    action['time'] = time
                    action['message'] = False
                    action['text'] = ''
                    actions.append(action)
                    process_color = False

                elif 'MSGR1' in line:
                    process_message = True
                elif process_message:
                    words = line.split('\t')
                    action = dict()
                    action['player id'] = words[2].strip()
                    action['color'] = 'white'
                    action['time'] = time
                    action['message'] = True
                    structured = session['info']['structured'] == 'true'
                    if structured:
                        action['text'] = ''
                    else:
                        action['text'] = words[4].strip().replace("\\", "\\\\")
                    actions.append(action)
                    process_message = False

                elif 'SEST2' in line:
                    session_in = False
                    session['actions'] = actions
                    self.sessions.append(session)